import os
import json
from flask_cors import CORS #allows you to call the flask functions
from flask import Flask, request, jsonify

from dotenv import load_dotenv

from API_services.apify import APIFY_LinkedIn_WebScrape
from API_services.gemini import GEMINI_Response

load_dotenv("../.env")

app = Flask(__name__)
CORS(app)


@app.route('/scrape-linkedin', methods=['POST']) #call from the frontend to ask to webscrape
def scrape_linkedin():
    userInput = request.get_json()
    """ Looks like this:
        userInput = {
                    'url': 'https://www.linkedin.com/username', 
                    'prompt': 'I want to message this person to tell them that I want to work with them'
                    }
    """
    #helper function to check and make sure the UserInput isn't messed up (EX: the url is not there)
    validateUserInput(userInput)
    
    url = userInput['url']
    prompt = userInput['prompt']
    
    try:
        #WS_info is shorthand for web scrape info
        WS_info = APIFY_LinkedIn_WebScrape(url)

        aiResponse = GEMINI_Response(WS_info, prompt)

        return jsonify({
            'email_address': WS_info.get("email"), #gets the email from the Web Scraping
            'email_body': aiResponse['email_output'], #Generated email body via Gemeni
            'analysis_rationale': aiResponse['analysis_rationale'], #generated analysis built by Gemeni
        })

    #If this is ran, you definatly blundered somewhere
    except Exception as e:
        return jsonify({'error located in app.py/sceape_linkedin': str(e)}), 500

#TODO: FIX THIS VIBE CODED Garbage, We need to fix the GEMENI_Response function
@app.route('/improve-email', methods=['POST'])
def improve_email():

    
    data = request.get_json()
    
    if not data or 'email' not in data or 'prompt' not in data:
        return jsonify({'error': 'Missing email or prompt in request'}), 400

    email_content = data['email']

    prompt = data['prompt']
    recipient_name = data.get('recipient_name', 'the recipient')
    
    try:
        message = client.models.generate_content(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction=
                    "You're a skilled B2B copywriter who knows how to improve cold emails to make them more effective. Your job is to refine and enhance an existing email based on specific improvement instructions.\n\n**Your task:**\nImprove the provided email using the following rules:\n\n- Always start with: **Dear [First Name],**\n- Keep it brief — aim for **4 to 6 sentences total**\n- Make it personal and maintain any personalization from the original email\n- Focus on **real value** — how does this offering help solve a challenge or make their work easier, faster, or more effective?\n- Use a **natural, conversational tone** — like it was written by a thoughtful human\n- End with a **light, low-pressure CTA** — like asking if they'd be open to a quick call or if it makes sense to connect\n- Avoid all fluff — skip generic intros like \"Hope you're well,\" marketing buzzwords, or long walls of text\n\n**Output format (JSON only):**\n```json\n{\n  \"email_output\": \"The full body of the improved email starting with 'Dear [First Name],'\",\n  \"improvement_rationale\": [\n    \"Explanation of key improvements made to the email\",\n    \"How the improvements address the specific prompt instructions\",\n    \"Why these changes will make the email more effective\"\n  ]\n}\n```\n\n**Never include anything outside this JSON structure. No explanations, no extra text, just valid JSON.**"
                ,
            ),
            contents=[
                f"Here is the original email:\n\n{email_content}\n\nThe recipient's name is {recipient_name}.\n\nImprovement instructions: {prompt}"
            ]
        )

        response = message.text
        
        # Extract JSON from the response
        if '```json' in response and '```' in response:
            json_str = response.split('```json')[1].split('```')[0].strip()
        else:
            json_str = response
            
        json_response = json.loads(json_str)

        return jsonify({
            'improved_email': json_response['email_output'],
            'improvement_rationale': json_response['improvement_rationale'],
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


"""[Handwritten] This is used to validate the User Input to make sure it's legit"""
def validateUserInput(userInput):
    #Check to see if backend even received the userInput:
    if not userInput:
        return jsonify({'error': 'backend didnt receive userInput'}), 400
    
    # Check to see if url was received by backend
    if 'url' not in userInput:
        return jsonify({'error': 'Missing URL in request'}), 400

    # Check to see if prompt was received by backend
    if 'prompt' not in userInput:
        return jsonify({'error': 'Missing prompt in request'}), 400


if __name__ == '__main__':
    app.run(debug=True)
