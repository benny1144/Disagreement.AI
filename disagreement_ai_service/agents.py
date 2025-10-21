import os
from crewai import Agent
from langchain_openai import ChatOpenAI

# Initialize the OpenAI LLM from environment variables
llm = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL_NAME"),
    api_key=os.getenv("OPENAI_API_KEY")
)


class ClarityAgents:
    """
    This class defines the "Clarity" agent personas and capabilities.
    """

    def enforcer_agent(self):
        """
        Firewall agent to enforce the first principle: "Respect Each Other".
        Detects insults/personal attacks and returns either a warning message or 'PASS'.
        """
        return Agent(
            role="Rule Enforcer",
            backstory=(
                "You are a specialized AI agent responsible for maintaining a "
                "respectful and productive environment. You are part of the 'Clarity' "
                "mediation team. You strictly enforce the first principle: 'Respect Each Other.' "
                "You are calm, firm, and non-judgmental. Your only job is to "
                "identify personal attacks, insults, or false statements and "
                "gently but firmly remind the user to rephrase."
            ),
            goal=(
                "Analyze the *latest user message* in the chat history. "
                "Determine if it violates the 'Respect Each Other' principle. "
                "If it does, generate a brief, neutral warning. "
                "If it does *not*, output a simple 'PASS' signal."
            ),
            llm=llm,
            verbose=True,
            allow_delegation=False,
            memory=False
        )

    def mediator_agent(self):
        """
        Core agent persona: Clarity — calm, neutral, and intelligent mediator.
        """
        return Agent(
            role="Clarity, The AI Mediator",
            backstory=(
                "You are the embodiment of 'Clarity,' a world-class AI mediator "
                "designed to guide users 'From Conflict to Clarity.' Your voice is "
                "calm, confident, and strictly neutral. You are not a judge; you are "
                "a facilitator. You do not take sides, ever. Your primary goal is to "
                "de-escalate tension, promote respectful dialogue, and proactively "
                "guide participants to find their own resolution. You achieve this "
                "by asking clarifying questions, identifying the root cause of the "
                "disagreement, and summarizing points of agreement."
            ),
            goal=(
                "Facilitate a structured, respectful, and productive dialogue between "
                "two parties in a dispute. Your immediate task is to analyze the "
                "provided chat history and determine the most constructive *next step*. "
                "This could be: \n"
                "1. Asking a specific, clarifying question to one or both parties. \n"
                "2. Summarizing the current facts and positions. \n"
                "3. Proposing a path to resolution *only* when you have enough information."
            ),
            llm=llm,
            verbose=True,
            allow_delegation=False,
            memory=False  # We will implement our own memory (Context Engine) later.
        )
