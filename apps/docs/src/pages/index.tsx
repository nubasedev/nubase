import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout description={siteConfig.tagline}>
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "3rem" }}>{siteConfig.title}</h1>
        <p style={{ fontSize: "1.25rem", maxWidth: "600px" }}>
          {siteConfig.tagline}
        </p>
        <Link
          to="/docs/intro"
          style={{
            padding: "0.75rem 2rem",
            fontSize: "1.1rem",
            borderRadius: "8px",
            backgroundColor: "var(--ifm-color-primary)",
            color: "white",
            textDecoration: "none",
          }}
        >
          Get Started
        </Link>
      </main>
    </Layout>
  );
}
