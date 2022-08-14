import React from 'react';
import Hero from '../components/hero/Hero';
import Page from '../components/page/Page';

const Home = (): JSX.Element => {
  return (
    <Page title="Home">
      <Hero />
    </Page>
  );
};

export default Home;
