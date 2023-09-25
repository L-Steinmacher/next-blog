---
title: 'Langchain and Beyond'
excerpt:
    "So, I'm pretty big into the AI hype and enjoy learning new things, so I thought I'd give an update on what I've been working on and some things that I'm interested in...."
date: '2023-09-25T16:03:11.308Z'
author:
    name: Lucas Steinmacher
---

So, I'm pretty big into the AI hype and enjoy learning new things, so I thought
I'd give an update on what I've been working on and some things that I'm
interested in.

## AI Hackathon

I recently competed in an AI hackathon put on by
[Fixie AI](https://www.fixie.ai/), in which my team built a travel assistant
based on the Fixie AI Corpus API and their generative AI.JSX. The Fixie
[Corpus API](https://docs.fixie.ai/api/corpus/fixie-corpus-api) allows you to
create a corpus of documents that are crawled and indexed for access by Fixie
Agents via their Corpus API, cURL, or the dashboard.
[AI.JSX ](https://docs.ai-jsx.com/) is a framework for building AI applications
using JavaScript and JSX, designed to integrate seamlessly with React-based
projects.

We trained our app on articles based on preset locations to provide up-to-date
travel recommendations from [Atlas Obscura](https://www.atlasobscura.com/) and [Eater](https://seattle.eater.com/), utilizing the Google
Maps API. The idea was to allow a user to select any location from the Google
Maps API and receive up-to-date travel information based on the selected sites.
What we ended up with was more of a proof of concept, in which we had
pre-selected cities and only a few articles uploaded since the scraping took
some time. But what do you expect from a 5-hour hackathon?
[Link](https://travel-recommendation-engine.vercel.app/travel) to the live demo.

## Langchain.js

Also, I’m excited to have finished the latest update to this site! It's a
trivial example of how to use Langchain.Js for translations. I set up an API in
the comment section and gave every user who logs in five tokens to play with the
translation presets that I've set up. Under the "Edit" section of a comment,
you'll find the translation selector with four presets to help you edit your
content: German, Spanish, Bruh, and the Intelligizer! [^1]

The comment translated using ChatGPT 3.5-turbo using a single call with no conversation and parsed to a string rather than streamed in.

```ts
async function langchainCall(content: string): Promise<string> {
    if (!openAIApiKey) throw new Error("No OpenAI API key found in env")

    const promptTemplate = PromptTemplate.fromTemplate(
        "You are a helpful assistant that translates a comment into another language or format as instructed. your reply must be 500 characters or less if the content is over 500 characters abbreviate it to just 500 characters. {input}"
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
```

The first two are self-explanatory and simply translate your comment into German
or Spanish. The third, "Bruh," gives you a personality similar to a surfer guy
who constantly talks about his buddy Chad. Finally, there's the Intelligizer,
which is supposed to be kind of a joke[^2], which will read the content of the blog
post and expand upon your comment's content!

![Translator in action!](/images/translation_final.gif)

Currently, the edit/translation function only transforms and saves your comment
and doesn't have the memory to remember the original content of your comment.
But don't worry, if you just want to try it out, feel free to delete it right
afterward. That functionality will be coming soon. It was just fun implementing
a quick translator with Langchain, and I'm excited to implement more AI and use
LLMs on my site. So stay tuned for more features to come!

That's it for now! Feel free to leave a comment and try out the translation to
see how ChatGPT does against Google's translation!

[^1]: Results may vary.
[^2]: Contrary to popular belief, using a feature like this does not actually make you ANY more intelligent. Read more, learn, grow. I'm adding in this silly option of what a call like this could do, what it should do.