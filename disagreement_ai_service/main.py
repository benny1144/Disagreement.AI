import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import MediationRequest, MediationResponse
from dotenv import load_dotenv
from crew import MediationCrew
import json

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Disagreement.AI - Clarity AI Service",
    description="The AI microservice powering all mediation and resolution agents.",
    version="1.1.0"
)

# --- CORS Configuration ---
# This is critical for allowing our frontend to communicate with this service.
origins = [
    "http://localhost:5173",  # Our standard Vite frontend port
    "http://localhost:5174",  # Sometimes Vite uses this port
    "http://localhost:3000"   # Our standard Node.js backend port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health Check"])
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "Clarity AI Service"}

@app.post("/mediate", tags=["Mediation"], response_model=MediationResponse)
async def mediate_dispute(request: MediationRequest):
    """
    The primary endpoint for processing a dispute chat and getting an
    intelligent response from the Clarity AI mediator.
    """
    print("--- Received Mediation Request ---")
    print(f"Dispute Context: {request.dispute_context}")
    print("--- Kicking off CrewAI ---")

    try:
        # Initialize and run CrewAI
        crew = MediationCrew(
            context=request.dispute_context,
            chat_history=request.chat_history,
        )
        raw_result = crew.run()
        print(f"--- CrewAI Raw Result ---\n{raw_result}\n--------------------------")

        # Parse JSON result
        try:
            parsed = json.loads(raw_result)
        except (json.JSONDecodeError, TypeError):
            print("Error: CrewAI did not return valid JSON. Returning raw string.")
            return MediationResponse(
                response_message=str(raw_result),
                updated_context=request.dispute_context,
            )

        return MediationResponse(
            response_message=parsed.get("response_message", "Error: No response message."),
            updated_context=parsed.get("updated_context", request.dispute_context),
        )

    except Exception as e:
        print("--- CRITICAL CREW ERROR ---")
        print(f"Error: {e}")
        print("-----------------------------")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the mediation: {str(e)}",
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
