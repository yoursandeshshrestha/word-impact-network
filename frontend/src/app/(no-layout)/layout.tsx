import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Impact Network",
  description: "Word Impact Network",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
