import Image from "next/image";

export default function About() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-16">
      <article>
        <section>
          <div>
            <div className="flex flex-row w-full items-center  pb-4">
              <h2 className="mb-12 text-center pr-10 text-xl font-bold leading-tight tracking-tighter md:text-left md:text-4xl md:leading-none lg:text-4xl">
              Impatient? TL;DR
            </h2>
            <Image
              src="/images/indy-bst-ever-cropped.jpg"
              className="rounded-full object-cover"
              width={120}
              height={120}
              alt="Lucas Steinmacher photo"
            />
            </div>
            <p>
              Howdy! I'm Panz... err, Lucas, whatever you feel like calling me.
              They're interchangeable, so feel free to use either. I'm a
              software engineer based out of the greater Seattle area, and I
              enjoy building things that make people's lives easier, mainly with
              TypeScript.
              <br />
              <br />
            </p>
          </div>
        </section>
        <section>
          <div className="mt-8">
            <h2 className="mb-12 text-center text-xl font-bold leading-tight tracking-tighter md:text-left md:text-4xl md:leading-none lg:text-4xl">
              About Me
            </h2>
            <p>
              As mentioned before, I'm a software engineer based out of the
              greater Seattle area. I've been working in the industry for about
              3 years now, and I've been loving every minute of it.
              <br />
              <br />
              Also, as mentioned, I used to work in the service industry as a
              chef, mainly in fine dining, which I feel gives me a unique
              perspective on software and how it affects the clients using it.
              The service is at the forefront of the process.
              <br />
              <br />A little more about me: I grew up in Northern Michigan
              enjoying the outdoors and all the activities that come with it,
              such as snowboarding, hiking, and trail running. To this day, I
              still enjoy staying active by running, hiking, and mixing in some
              yoga into my routine.
              <br />
              <br />
              Even though I don't profesionally cook anymore, I still enjoy
              bakeing, cooking for loved ones and throwing a BBQ every once in a
              while. It's how I show my love for the people in my life. I will
              always be in love with food and the culture that surrounds it.
              <br />
              <br />
            </p>
          </div>
        </section>
        <section>
          <div className="mt-8">
            <h2 className="mb-12 text-center text-xl font-bold leading-tight tracking-tighter md:text-left md:text-4xl md:leading-none lg:text-4xl">
              Ok, Whats whith the name?
            </h2>
            <p>
              Why I'm so glad you asked. Panz (pronounced like the plural of the
              cooking utensil, pans) was given to me when I was working in fine
              dining as a chef at a restaurant named{' '}
              <a
                className="text-[#d68501] hover:text-[#d68401bb] hover:underline"
                href="https://www.seattletimes.com/life/food-drink/seattles-james-beard-award-winning-restaurant-tilth-is-closing-forever/"
                alt="Tilth restaurant"
                target="_blank"
                rel="me noopener noreferrer"
              >
                Tilth
              </a>{' '}
              where they liked to give out nicknames to the senior staff. I was
              told that the name was given to me because of my Germanic last
              name and the fact that I'm a{' '}
              <a
                className="text-[#d68501] hover:text-[#d68401bb] hover:underline"
                href="https://en.wiktionary.org/wiki/Panzer"
                alt="Panzer"
                target="_blank"
                rel="me noopener noreferrer"
              >
                tank
              </a>{' '}
              in the kitchen. Anyhow, the name was given to me and it stuck
              around, and I just kinda ran with it.
              <br />
              <br />
              Whatever you call me, just don't overthink it.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}
