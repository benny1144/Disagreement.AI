from crewai import Crew, Process
from agents import ClarityAgents
from tasks import MediationTasks
from schemas import ChatMessage
from typing import List


class MediationCrew:
    def __init__(self, context: str, chat_history: List[ChatMessage]):
        self.context = context
        self.chat_history = chat_history
        self.agents = ClarityAgents()
        self.tasks = MediationTasks()

    def run(self):
        """Assemble and run the mediation crew sequentially."""
        # Define agents
        mediator = self.agents.mediator_agent()

        # Define tasks
        task = self.tasks.mediate_task(
            agent=mediator,
            context=self.context,
            chat_history=self.chat_history,
        )

        # Assemble Crew
        crew = Crew(
            agents=[mediator],
            tasks=[task],
            process=Process.sequential,
            verbose=2,
        )

        # Run Crew
        result = crew.kickoff()
        return result
