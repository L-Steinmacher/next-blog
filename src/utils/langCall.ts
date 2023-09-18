import { PromptTemplate } from 'langchain/prompts'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { CallbackManager } from 'langchain/callbacks'
import { RunnableSequence } from 'langchain/schema/runnable'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { env } from '~/env.mjs'

const openAIApiKey = env.OPENAI_API_KEY;

export async function LangCall(commentContent: string, caseType: string, postContent?: string): Promise<string> {
    switch (caseType) {
        case "spanish":
            const spanishTranslationPrompt = `
CONTENT:
${commentContent}
===
Please translate the above content to Spanish. Use relative terms and slang so that it is fermiliar to native speakers
`.trim()
            const res = await langchainCall(spanishTranslationPrompt)
            console.log(res)
            return res

        case "german":
            const germanTranslationPrompt = `
CONTENT:
${commentContent}
===
Please translate the above content to German. Use relative terms and slang so that it is fermiliar to native speakers
`.trim()
            return await langchainCall(germanTranslationPrompt)

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
            return await langchainCall(bruhTranslationPrompt)

        case "intellegizer":
            if (!postContent) throw new Error("intellegizer case requires postContent")
            const intellegizerTranslationPrompt = `
CONTENT:
${commentContent}
===
POST :
${postContent}
===
The POST is a comment on a blog post for your reference only. do not translate the POST or give an answer using html.
Please elaborate on the CONTENT  based on the POST.
`.trim()
            return await langchainCall(intellegizerTranslationPrompt)

        default:
            return "Something went wrong in switch case."
    }
}

async function langchainCall(content: string): Promise<string> {
    if (!openAIApiKey) throw new Error("No OpenAI API key found in env")

    const promptTemplate = PromptTemplate.fromTemplate(
        "You are a helpful assistant that translates a comment into another language or format as instructed. {input}"
    )

    const llm = new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        openAIApiKey,
        streaming: true,
        callbackManager: CallbackManager.fromHandlers({
            handleLLMStart: () => {
                console.log(`handleLLMStart`)
            },
            handleLLMError: (err) => {
                console.log(`handleLLMError`, err)
            },
            handleLLMEnd: () => {
                console.log(`handleLLMEnd`)
            },
        }),
    })

    const outputParser = new StringOutputParser();
    const chain = RunnableSequence.from([promptTemplate, llm, outputParser]);
    const result = await chain.invoke({ input: content });
    return result;
}