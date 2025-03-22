import os
import json
from flask import Flask, request, jsonify
from API_services.apify import APIFY_LinkedIn_WebScrape
from groq import Groq
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv("../.env")

app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.route('/scrape-linkedin', methods=['POST'])
def scrape_linkedin():
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({'error': 'Missing URL in request'}), 400

    url = data['url']
    prompt = data['prompt']
    
    try:
        result_str = APIFY_LinkedIn_WebScrape(url)
        result = json.loads(result_str)

        email = result.get("email")
        about = result.get("about", "")
        headline = result.get("headline", "")
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
            "role": "system",
            "content": "You're a skilled B2B copywriter who knows how to write cold emails that actually get replies. Your job is to craft short, thoughtful, and personalized emails for enterprise decision-makers based on their LinkedIn profiles and a quick briefing on the product or service being offered.\n\nHere’s what you’ll get to work with:\n\n- A snapshot of the person’s LinkedIn info — things like their name, job title, company, industry, recent posts, achievements, or shared interests.  \n- A campaign prompt that explains the product/service, the value it brings, and what kind of call-to-action we’re aiming for.\n\n**Your task:**\nWrite only the body of the email (no subject line or extra headers) using the following rules:\n\n- Always start with: **Dear [First Name],**\n- Keep it brief — aim for **4 to 6 sentences total**\n- Make it personal — use **relevant LinkedIn details** to show we’ve done our homework\n- Focus on **real value** — how does this offering help solve a challenge or make their work easier, faster, or more effective?\n- Use a **natural, conversational tone** — like it was written by a thoughtful human\n- End with a **light, low-pressure CTA** — like asking if they’d be open to a quick call or if it makes sense to connect\n- Avoid all fluff — skip generic intros like “Hope you’re well,” marketing buzzwords, or long walls of text\n\n**Output format (JSON only):**\n```json\n{\n  \"email_output\": \"The full body of the email starting with 'Dear [First Name],'\",\n  \"analysis_rationale\": [\n    \"Insightful reasoning based on LinkedIn activity or achievements — e.g., recent promotion, project success, or strong content engagement\",\n    \"What makes this person's performance or profile impressive and why it was used in the email\",\n    \"Any connections between their career performance and the value proposition of the offering\"\n  ]\n}\n```\n\n**Never include anything outside this JSON structure. No explanations, no extra text, just valid JSON.**"
        },
                {"role": "user", "content": f"***Important prompt***:[ {prompt} ]. {headline}. {about}."},
            ],
            model="llama-3.3-70b-versatile",
        )

        response = chat_completion.choices[0].message.content

        json_response = json.loads(response[7:-3])

        return jsonify({
            'email': email,
            'groq_response': json_response['email_output'],
            'analysis_rationale': json_response['analysis_rationale'],
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)