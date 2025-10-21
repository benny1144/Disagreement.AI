from crewai import Task
from typing import List
from schemas import ChatMessage


class MediationTasks:
    """
    Defines the specific job for the Clarity mediator agent.
    """

    def mediate_task(self, agent, context: str, chat_history: List[ChatMessage]):
        """
        Primary task for the mediator agent.
        Processes the context and chat history to generate the next response.
        """
        # Format the chat history for the agent as simple role: content lines
        formatted_history = "\n".join([f"{msg.role}: {msg.content}" for msg in chat_history])

        return Task(
            description=(
                "Analyze the dispute context and the full chat history to generate the next response."
            ),
            expected_output=(
                "A single, concise JSON object containing two keys: \n"
                "1. 'response_message': Your next conversational turn as 'Clarity'. This is what you will say to the users. \n"
                "2. 'updated_context': An updated, brief summary of the dispute's current state for your *internal memory*."
            ),
            agent=agent,
            inputs={
                "dispute_context": context,
                "chat_history": formatted_history,
            },
            output_json=True,
        )
