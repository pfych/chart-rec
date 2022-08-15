import React from 'react';
import styles from './hero.module.scss';

const Hero = (): JSX.Element => (
  <div className={styles.hero}>
    <h1>Chart rec</h1>

    <p>
      <br />
      Pull scores from Kamaitachi and recommend charts to go for CLEAR
      <br />
      <a href={'/sign-in'}>Sign In</a>
    </p>
  </div>
);

export default Hero;
