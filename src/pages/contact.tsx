import Head from 'next/head';

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Me - Lucas Steinmacher</title>
        <meta
          name="description"
          content="Get in touch with Lucas Steinmacher. Reach out via email or check out his socials for more updates."
        />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <div className="mx-auto max-w-2xl px-6 pt-16">
        <div>
          <h2 className="mb-12 text-center text-xl font-bold leading-tight tracking-tighter md:text-left md:text-6xl md:leading-none lg:text-4xl">
            Contact
          </h2>
        </div>
        <div className="mt-8">
          <p className="text-lg">
            If you&apos;d like to get in touch with me, feel free to reach out via
            email at:
            <br /> <br />
            <a
              className="text-[#d68501]  hover:text-[#d68401bb] hover:underline"
              href="mailto:lucaslsteinmacher@gmail.com"
            >
              lucaslsteinmacher@gmail.com
            </a>
            <br />
            <br />
            Also my socials are plastered all over above and below so feel free
            to check out my stuff there.
          </p>
        </div>
      </div>
    </>
  );
}
