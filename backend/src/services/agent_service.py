import os
from dotenv import load_dotenv
load_dotenv()
import logging
from typing import Dict, Any, List, Optional
from agents import Agent, Runner, RunConfig, OpenAIChatCompletionsModel
from openai import AsyncOpenAI
from pydantic import BaseModel
from src.connection import config

logger = logging.getLogger(__name__)

class AgentService:
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        """
        Initialize the Agent Service with OpenAI Agents SDK
        """
        # Set the OpenAI API key
        gemini_api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")

        os.environ["GOOGLE_GEMINI_API_KEY"] = gemini_api_key

        # Initialize the OpenAI Agent
        self.agent = Agent(
            name="Book RAG Assistant",
            model=model_name,
            instructions=(
                "You are a helpful assistant that answers questions based on provided context. "
                "Only use information from the context to answer the question. "
                "If the context doesn't contain information to answer the question, say so clearly. "
                "Be concise and accurate in your responses."
            ),
        )

    async def generate_response(self, prompt: str, context: Optional[List[Dict[str, str]]] = None) -> str:
        """
        Generate a response using the agent with optional context
        """

        try:
            # Prepare the full prompt with context if provided
            full_prompt = prompt
            if context:
                context_str = "\n\nContext information:\n"
                for i, ctx in enumerate(context):
                    context_str += f"{i+1}. {ctx.get('text', '')}\n"
                full_prompt = f"{context_str}\n\nQuestion: {prompt}"

            # Run the agent with the prompt
            result =await Runner.run(
                self.agent,
                full_prompt,
                run_config=config
            )

            return result.final_output if result.final_output else "I couldn't generate a response for your query."

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "Sorry, I encountered an error while processing your request."

    async def generate_response_with_guardrails(self,
                                       user_query: str,
                                       retrieved_context: List[Dict[str, Any]],
                                       system_prompt: str = None) -> str:
        """
        Generate a response with guardrails to ensure answers are based on retrieved context
        """
        if system_prompt is None:
            system_prompt = (
                "You are a helpful assistant that answers questions based on the provided context. "
                "Only use information from the context to answer the question. "
                "If the context doesn't contain information to answer the question, say so clearly. "
                "Be concise and accurate in your responses."
            )

        try:
            # Prepare context from retrieved information
            context_texts = []
            for ctx in retrieved_context:
                text = ctx.get('text', '')
                if text:
                    context_texts.append(text)

            # Combine context
            combined_context = "\n\n".join(context_texts) if context_texts else "No relevant context found."

            # Create the full prompt
            full_prompt = (
                f"{system_prompt}\n\n"
                f"Context:\n{combined_context}\n\n"
                f"Question: {user_query}\n\n"
                f"Answer based only on the provided context:"
            )

            # Run the agent with the prompt
            result = await Runner.run(
                self.agent,
                full_prompt,
                run_config=config
            )

            return result.final_output if result.final_output else "I couldn't generate a response based on the provided context."

        except Exception as e:
            logger.error(f"Error generating response with guardrails: {e}")
            return "Sorry, I encountered an error while processing your request."

    def validate_api_connection(self) -> bool:
        """
        Validate if the API connection is working
        """
        try:
            result = Runner.run_sync(
                self.agent,
                "Test message to validate API connection"
            )
            return bool(result.final_output)
        except Exception as e:
            logger.error(f"API connection validation failed: {e}")
            return False

# Example usage
if __name__ == "__main__":
    # Initialize the service
    agent_service = AgentService()

    # Test the connection
    if agent_service.validate_api_connection():
        print("API connection successful")

        # Test response generation
        response = agent_service.generate_response("Hello, how are you?")
        print(f"Response: {response}")
    else:
        print("API connection failed")