import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate
} from 'langchain/dist/prompts'
import { ChatOpenAI } from 'langchain/chat_models'
import { CallbackManager } from 'langchain/dist/callbacks'
import { ConversationChain } from 'langchain/chains'

export function LangCall(commentContent: string, caseType: string, postContent?: string): string {
    switch (caseType) {
        case "spanish":
            const spanishTranslationPrompt = `
CONTENT:
${commentContent}
===
Please translate the above content to Spanish. Use relative terms and slang so that it is fermiliar to native speakers
`.trim()
            return ""
        case "german":
            const germanTranslationPrompt = `
CONTENT:
${commentContent}
===
Please translate the above content to German. Use relative terms and slang so that it is fermiliar to native speakers
`.trim()
            return ""
        case "bruh":
            const bruhTranslationPrompt = `
            CONTENT:
            ${commentContent}
            ===
Please translate the CONTENT to tech bro speak.
Use sentence openers like, "So like" "Totally" and others that you feel are appropriate.
Every once on a while mention a guy named Chad and how sweet you think he is or what you think Chad would think about a point in the CONTENT.
MAX character count: ${commentContent.length * 2}
`.trim()
            return ""
        case "intellegizer":
            if (!postContent) throw new Error("intellegizer case requires postContent")
            const intellegizerTranslationPrompt = `
CONTENT:
${commentContent}
===
POST CONTENT:
${postContent}
===
Please elaborate on the text by adding fillers and attempting to make the text sound more intellegent based on the POST. Make one or two spelling errors and be sure to include one sentence that factually incorrect to the CONTENT. max characters 1000
`.trim()
            return ""
        default:
            return "Something went wrong."
    }
}

async function langchainCall(promptString: string, content: string): Promise<string> {
    const openAIApiKey = process.env.OPENAI_KEY;
    const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(
        "You are a helpful assistant that translates a comment into another language or format as instructed."
    )
    const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate("{input}")
    const prompt = ChatPromptTemplate.fromPromptMessages([systemMessagePrompt, humanMessagePrompt])

    const llm = new ChatOpenAI({
        modelName: "gpt-4",
        openAIApiKey,
        streaming: true,
        callbackManager: CallbackManager.fromHandlers({
            handleLLMStart: () => {
                console.log(`handleLLMStart`)
            },
          handleLLMError: async err => {
            console.log(`handleLLMError`, err)
          },
          handleLLMEnd: () => {
            console.log(`handleLLMEnd`)
          },
        }),
      })

      const chain = new ConversationChain({
        llm,
        prompt,
      })

      const formattedComment = await chain.call({input: content})
      return formattedComment;
}