import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from crew import create_disagreement_crew # We import our crew creation function

# Load environment variables
load_dotenv()

# Initialize the Flask application
app = Flask(__name__)

@app.route('/process_disagreement', methods=['POST'])
def process_disagreement_endpoint():
    """
    API endpoint to process a disagreement.
    Expects a JSON payload with a "dispute_text" key.
    """
    data = request.get_json()
    if not data or 'dispute_text' not in data:
        return jsonify({"error": "Missing 'dispute_text' in request body"}), 400

    dispute_text = data['dispute_text']

    try:
        # Create and run the crew
        crew = create_disagreement_crew(dispute_text)
        result = crew.kickoff()

        # Return the final result as JSON
        return jsonify({"resolution": result})

    except Exception as e:
        # Return any errors that occur during the process
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True, port=5001)