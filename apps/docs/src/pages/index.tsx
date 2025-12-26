import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import type { ReactNode } from "react";

import styles from "./index.module.css";

function InstallationBox() {
  return (
    <div className={styles.installationBox}>
      <div className={styles.codeBlock}>
        <code>npx @nubase/create</code>
      </div>
    </div>
  );
}

function HomepageHero() {
  return (
    <div className={styles.heroContainer}>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className={styles.heroTitle}>
            Build business applications and internal tools at the speed of
            thought
          </Heading>
          <p className={styles.heroSubtitle}>
            Nubase is a highly-opinionated, batteries-included, meta-framework
            for building business applications and internal tools with
            TypeScript.
          </p>
          <div className={styles.heroActions}>
            <Link className="button button--primary button--lg" to="/intro">
              Get started
            </Link>
            <InstallationBox />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Build business applications and internal tools at the speed of light"
    >
      <main>
        <HomepageHero />
      </main>
    </Layout>
  );
}
