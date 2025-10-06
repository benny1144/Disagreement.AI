import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process

# Load environment variables from .env file
load_dotenv()

# --- AGENT DEFINITIONS ---

# --- Core Dispute Resolution Agents ---

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

# --- (BETA) Specialized Agents ---

# Agent 4: The Debate Facilitator (BETA)
debate_facilitator = Agent(
    role='Structured Debate Facilitator',
    goal='Ensure a fair, structured, and productive debate by enforcing rules and keeping participants on topic.',
    backstory=(
        "(BETA) You are an AI facilitator modeled on the principles of parliamentary debate. "
        "You ensure that each side has an equal opportunity to present their arguments, rebut points, and make a closing statement, "
        "all while maintaining a respectful and logical flow of conversation."
    ),
    verbose=True,
    allow_delegation=False,
)

# Agent 5: The Team Builder (BETA)
team_builder = Agent(
    role='Team Cohesion Analyst',
    goal='Identify and address the root causes of internal team conflict to improve collaboration and build a stronger, more unified team.',
    backstory=(
        "(BETA) You are an AI organizational psychologist specializing in team dynamics. "
        "You analyze conversations to find friction points, communication gaps, and conflicting goals, then propose "
        "actionable strategies and communication frameworks to resolve the underlying issues and strengthen team bonds."
    ),
    verbose=True,
    allow_delegation=False,
)


# --- TASK & CREW DEFINITIONS ---

def create_disagreement_crew(dispute_text):
    """
    Creates and configures the standard CrewAI crew to process a given dispute.
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
    return Crew(
        agents=[mediator, fact_finder, judge_jury],
        tasks=[fact_finding_task, mediation_task, judgment_task],
        process=Process.sequential,
        verbose=True
    )

# --- (BETA) Placeholder function for future crews ---
# Note: The tasks for these crews would need to be defined.
def create_specialized_crew(dispute_text, mode="debate"):
    """
    (BETA) This function would create specialized crews based on the selected mode.
    """
    if mode == "debate":
        # Define tasks for a debate...
        # debate_task_1 = Task(...)
        return Crew(agents=[debate_facilitator], tasks=[]) # Placeholder tasks
    elif mode == "team_building":
        # Define tasks for team building...
        # team_task_1 = Task(...)
        return Crew(agents=[team_builder], tasks=[]) # Placeholder tasks


# --- MAIN EXECUTION BLOCK ---

if __name__ == "__main__":
    print("## Welcome to the Disagreement.AI Crew")
    print('-----------------------------------------')

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