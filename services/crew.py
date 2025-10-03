import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process

# Load environment variables from .env file
load_dotenv()

# --- AGENT DEFINITIONS ---

# Agent 1: The Mediator
mediator = Agent(
    role='Senior Dispute Mediator',
    goal='Guide the conversation towards a mutually agreeable resolution. De-escalate tension and find common ground.',
    backstory=(
        "You are a seasoned mediator with decades of experience in resolving high-stakes corporate and interpersonal disputes. "
        "Your approach is empathetic but firm, always focusing on practical, win-win solutions."
    ),
    verbose=True,
    allow_delegation=False,
)

# Agent 2: The Fact-Finder
fact_finder = Agent(
    role='Lead Factual Analyst',
    goal='Diligently identify and extract all verifiable facts, claims, and evidence from the conversation text.',
    backstory=(
        "You are a meticulous paralegal and researcher, known for your ability to cut through emotional language "
        "and build a clear, unbiased timeline of events based purely on the provided information."
    ),
    verbose=True,
    allow_delegation=False,
)

# Agent 3: The Judge and Jury
judge_jury = Agent(
    role='Impartial Adjudicator',
    goal='Analyze the collected facts and arguments to propose a fair, non-binding resolution based on principles of equity and common sense.',
    backstory=(
        "You are a respected retired judge, known for your wisdom and impartiality. You do not issue legal rulings, "
        "but rather provide a final, reasoned recommendation on what would constitute a fair outcome for all parties involved."
    ),
    verbose=True,
    allow_delegation=False,
)

# --- TASK DEFINITIONS ---

def create_disagreement_crew(dispute_text):
    """
    This function creates and configures the CrewAI crew to process a given dispute.
    """
    # Task 1: Find the Facts
    fact_finding_task = Task(
        description=f"Analyze the following dispute and extract all key facts, claims, and pieces of evidence. Present them as a clear, itemized list.:\n\n---\n{dispute_text}\n---",
        expected_output="A bulleted list of all verifiable facts, claims, and evidence presented by each party.",
        agent=fact_finder
    )

    # Task 2: Mediate the Dispute
    mediation_task = Task(
        description="Based on the extracted facts, act as a neutral mediator. Identify the core conflict and suggest three potential paths to a compromise.",
        expected_output="An analysis of the core conflict and three distinct, actionable suggestions for a compromise.",
        agent=mediator
    )

    # Task 3: Propose a Final Resolution
    judgment_task = Task(
        description="Review the facts and the proposed compromises. Propose a final, non-binding resolution that is fair and equitable to both parties.",
        expected_output="A single, clear paragraph outlining a recommended resolution, explaining the reasoning behind it.",
        agent=judge_jury
    )

    # Create the Crew
    disagreement_crew = Crew(
        agents=[mediator, fact_finder, judge_jury],
        tasks=[fact_finding_task, mediation_task, judgment_task],
        process=Process.sequential,
        verbose=True # Set to True to see agent's step-by-step execution
    )

    return disagreement_crew

# --- MAIN EXECUTION BLOCK ---

if __name__ == "__main__":
    print("## Welcome to the Disagreement.AI Crew")
    print('-----------------------------------------')

    # This is the same dispute text from our test
    dispute_text = """
    The client, a small bakery named "Sweet Dreams," claims they are not obligated to pay the final 50% invoice to the freelance web developer.
    The developer delivered the final website last week, but the client states that the e-commerce functionality does not work as expected.
    Specifically, they claim that customers cannot complete a purchase using PayPal, which was a key requirement in the project brief.
    The developer argues that the core website is complete and that the PayPal issue is a minor bug that can be fixed quickly.
    The developer is demanding final payment before fixing the bug, while the client is refusing to pay until the site is 100% functional.
    """

    crew = create_disagreement_crew(dispute_text)
    result = crew.kickoff()

    print("\n\n##################################################")
    print("## Crew Work Complete!")
    print("##################################################")
    print("\nFinal Resolution:")
    print(result)