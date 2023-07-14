
export default function Socials() {
    return (
        <div className="flex items-center space-x-2 mx-auto px-4 sm:px-8" >
            <a
            className="rounded-lg text-gray-700 hover:bg-yellow-200 dark:text-gray-200
            dark:hover:bg-yellow-800"
            target="_blank"
            rel="me noopener noreferrer"
            href="https://github.com/L-Steinmacher/next-blog"
            aria-label="GitHub source"
            >
                <svg aria-hidden="true" className="h-9 w-9 p-1" fill="currentColor" viewBox="0 0 24 24">
                    <path
                        fill-rule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483
                        0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608
                        1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088
                        2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988
                        1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112
                        6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202
                        2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566
                        4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019
                        10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clip-rule="evenodd"
                    />
                </svg>
            </a>
            <a
                href="https://twitter.com/panziewanz"
                title="twitter"
                target="_blank"
                rel="me noopener noreferrer"
                aria-label="Twitter"
                className="rounded-lg text-gray-700 hover:bg-yellow-200 dark:text-gray-200
                dark:hover:bg-yellow-800"
                ><span className="sr-only">Twitter</span>
                <svg className="h-9 w-9 p-1" fill="currentColor" viewBox="0 0 24 24" >
                    <path
                    d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022
                    5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107
                    4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0
                    012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834
                    2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                    />
                </svg>
            </a>
            {/* <a
                    title="twitch"
                    target="_blank"
                    rel="me noopener noreferrer"
                    aria-label="Twitch"
                    className="rounded-lg text-gray-700 hover:bg-yellow-200 dark:text-gray-200
                    dark:hover:bg-yellow-800">
                <svg className="h-9 w-9 p-1" fill="currentColor" viewBox="0 0 16 16" >
                <path d="M3.857 0 1 2.857v10.286h3.429V16l2.857-2.857H9.57L14.714 8V0H3.857zm9.714 7.429-2.285 2.285H9l-2 2v-2H4.429V1.143h9.142v6.286z"/>
                <path d="M11.857 3.143h-1.143V6.57h1.143V3.143zm-3.143 0H7.571V6.57h1.143V3.143z"/>
                </svg>
            </a> */}
            <a
                href="https://www.linkedin.com/in/lucas-l-steinmacher/"
                title="Linked In"
                target="_blank"
                rel="me noopener noreferrer"
                aria-label="Linked In"
                className="rounded-lg text-gray-700 hover:bg-yellow-200 dark:text-gray-200 dark:hover:bg-yellow-800"
                >
                <svg className="h-9 w-9 p-1" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526
                    1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0
                    1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0
                    .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878
                    1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274
                    0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0
                    7.225h2.4z" clipRule="evenodd" />
                </svg>
            </a>
            </div>
    )
}