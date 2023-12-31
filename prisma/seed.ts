import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
    console.log("Start seeding... 🌱");
    console.time(`Cleaning up Database... 🧹`)
    await prisma.comment.deleteMany({})
    await prisma.user.deleteMany({})
    console.timeEnd(`Cleaning up Database... 🧹`)

    const indy = await prisma.user.upsert({
        where: { email: "indy@dog.com" },
        update: {},
        create: {
            email: "indy@dog.com",
            name: "Indy",
        },
    });

    const sassy = await prisma.user.upsert({
        where: { email: "sassy@dog.com" },
        update: {},
        create: {
            email: "sassy@dog.com",
            name: "Sassy",
        },
    });

    await prisma.comment.create({
        data: {
            content: "This is a comment",
            postSlug: "embracing-change",
            commenter: {
                connect: {
                    id: indy.id,
                },
            },
        },
    });

    await prisma.comment.create({
        data: {
            content: "This is another comment",
            postSlug: "embracing-change",
            commenter: {
                connect: {
                    id: sassy.id,
                },
            },
        },
    });
}

seed()
    .then(async () => {
    await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
