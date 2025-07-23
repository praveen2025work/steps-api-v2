import type { GetServerSideProps } from 'next';

const IndexPage = () => {
  // This component will not be rendered because of the redirect.
  // It's just a placeholder to have a valid page component.
  return null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: '/workflow-inbox',
      permanent: false, // Using a temporary redirect (307)
    },
  };
};

export default IndexPage;