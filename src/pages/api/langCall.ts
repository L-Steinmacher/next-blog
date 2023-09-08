import {
    PromptTemplate,
} from 'langchain/dist/prompts'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { CallbackManager } from 'langchain/dist/callbacks'
import { RunnableSequence } from 'langchain/dist/schema/runnable'
import { StringOutputParser } from 'langchain/dist/schema/output_parser'

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
POST CONTENT:
${postContent}
===
Please elaborate on the text by adding fillers and attempting to make the text sound more intellegent based on the POST. Make one or two spelling errors and be sure to include one sentence that factually incorrect to the CONTENT. max characters 1000
`.trim()
            return await langchainCall(intellegizerTranslationPrompt)

        default:
            return "Something went wrong."
    }
}

async function langchainCall(content: string): Promise<string> {
    const openAIApiKey = process.env.OPENAI_KEY;
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

function go() {
    const commentContent = "This is a comment"
    const caseType = "spanish"
    const res = LangCall(commentContent, caseType)
    console.log(res)
}

go()