import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSession, useSession } from 'next-auth/react';
import { type GetServerSidePropsContext, type InferGetServerSidePropsType, type NextPage } from 'next';

const AdminRoute: NextPage<
InferGetServerSidePropsType<typeof getServerSideProps>
> =  () => {
  const router = useRouter();
  const { data: session } = useSession();

  // Check if the user is authenticated and an admin
  useEffect(() => {
    async function checkAdmin() {
      const session = await getSession();
      if (!session?.user || session.user?.isAdmin) {
        await router.replace('/'); // Redirect to the login page if not authenticated or not an admin
      }
    }
    void checkAdmin();
  }, [session, router]);

  console.log(JSON.stringify(session, null, 2));
  if (!session?.user || session.user.isAdmin) {
    return <div>Redirecting...</div>; // Show a loading message while redirecting
  }

  // Render the admin management content here
  return (
    <div>
      <h1>Admin Management Interface</h1>
      {/* Add your admin management content here */}
    </div>
  );
};

export default AdminRoute;

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ userId: string }>
  ) {
    const { req, res } = context;
    const isAdmin = req
      ? (await getSession({ req }))?.user?.isAdmin
      : false;

    if (!isAdmin) {
      res.writeHead(302, { Location: '/' });
      res.end();
    }
    return {
      props: {},
    };
  }

