from dotenv import load_dotenv #allow us to access the .env file for API key
from google import genai # from GEMINI API Docs
from google.genai import types # from GEMINI doc
import json
import os

load_dotenv("../../.env")

def GEMINI_Response(WS_info, prompt):

    # Get the info we need to dump into Gemini 
    about = WS_info.get("about", "")
    headline = WS_info.get("headline", "")
    fullName = WS_info.get("fullName", "")

    # Prompt Engineering Info:
    system_instructions = "You're a skilled B2B copywriter who knows how to write cold emails that actually get replies. Your job is to craft short, thoughtful, and personalized emails for enterprise decision-makers based on their LinkedIn profiles and a quick briefing on the product or service being offered.\n\nHere’s what you’ll get to work with:\n\n- A snapshot of the person’s LinkedIn info — things like their name, job title, company, industry, recent posts, achievements, or shared interests.  \n- A campaign prompt that explains the product/service, the value it brings, and what kind of call-to-action we’re aiming for.\n\n**Your task:**\nWrite only the body of the email (no subject line or extra headers) using the following rules:\n\n- Always start with: **Dear [First Name],**\n- Keep it brief — aim for **4 to 6 sentences total**\n- Make it personal — use **relevant LinkedIn details** to show we’ve done our homework\n- Focus on **real value** — how does this offering help solve a challenge or make their work easier, faster, or more effective?\n- Use a **natural, conversational tone** — like it was written by a thoughtful human\n- End with a **light, low-pressure CTA** — like asking if they’d be open to a quick call or if it makes sense to connect\n- Avoid all fluff — skip generic intros like “Hope you’re well,” marketing buzzwords, or long walls of text\n\n**Output format (JSON only):**\n```json\n{\n  \"email_output\": \"The full body of the email starting with 'Dear [First Name],'\",\n  \"analysis_rationale\": [\n    \"Insightful reasoning based on LinkedIn activity or achievements — e.g., recent promotion, project success, or strong content engagement\",\n    \"What makes this person's performance or profile impressive and why it was used in the email\",\n    \"Any connections between their career performance and the value proposition of the offering\"\n  ]\n}\n```\n\n**Never include anything outside this JSON structure. No explanations, no extra text, just valid JSON.** BUT REMOVE THE JSON Formatting, ```json/{CONTENT/}''' -> CONTENT"
    contents = f"Their name is {fullName}.\n\n***Important prompt***:[ {prompt} ]. {headline}. {about}."

    # DONT TOUCH THIS, I got this from the API DOCS, and just modified a bit
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        config=types.GenerateContentConfig(
            system_instruction=system_instructions),
        contents=contents
    )

    """ 
    GEMINI is very weird and the "response" is formatted differently. We gotta manually fix this, I just showed an :

    ----------------BEFORE----------------
     ```json
    {
    "email_output": ...
    "analysis_rationale": [
        ...
    ]
    }
    ```

    ----------------AFTER----------------
    {
    "email_output": ...
    "analysis_rationale": [
        ...
    ]
    }
    
    We do this cursed stuff to remove the first 7 characters: ('''json) and remove the last 3 characters (''')
    """
    
    response = response.text
    response = response[7: -3]
    response = json.loads(response)


    

    return response

