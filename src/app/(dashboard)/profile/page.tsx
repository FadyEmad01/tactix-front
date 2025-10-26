import { Metadata } from "next";
import Image from "next/image";
// import { METADATA } from "@/constants/metadata/website";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
// import Container from "@/components/Container";
import { cookies } from "next/headers";
import Container from "@/components/layout/Container";
import ProfileContent from "./ProfileContent";

/* -------------------------------------------------------------------------- */
/* 🧠 Generate Static Params (pre-render all member pages)                    */
/* -------------------------------------------------------------------------- */
// export async function generateStaticParams() {
//   return MEMBERS.map((member) => ({
//     teamMemberId: member.name.toLowerCase().replace(/\s+/g, "-"),
//   }));
// }

/* -------------------------------------------------------------------------- */
/* 🧠 Generate Dynamic Metadata (SEO per member)                              */
/* -------------------------------------------------------------------------- */
// export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
//   const { teamMemberId } = await params;
//   const memberId = decodeURIComponent(teamMemberId);

//   const member = MEMBERS.find(
//     (m) => m.name.toLowerCase().replace(/\s+/g, "-") === memberId.toLowerCase()
//   );

//   if (!member) {
//     return {
//       title: "Member Not Found | Seniors 2026",
//       description: "This team member could not be found.",
//     };
//   }

//   const title = `${member.name} — ${member.role} | Seniors 2026`;
//   const description = `Meet ${member.name}, ${member.role} from the Seniors 2026 Computer Science team. Discover their role and contributions.`;

//   return {
//     ...METADATA,
//     title,
//     description,
//     openGraph: {
//       ...METADATA.openGraph,
//       title,
//       description,
//       images: [
//         {
//           url: member.avatar,
//           width: 800,
//           height: 800,
//           alt: `${member.name} profile photo`,
//         },
//       ],
//       type: "profile",
//     },
//     twitter: {
//       ...METADATA.twitter,
//       title,
//       description,
//       images: [member.avatar],
//     },
//   };
// }

/* -------------------------------------------------------------------------- */
/* 🧩 Page Component                                                          */
/* -------------------------------------------------------------------------- */
export default async function profile() {
  const cookieStore = cookies();
  const userCookie = (await cookieStore).get("user")?.value;

  let user: any = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      user = null;
    }
  }

  return <ProfileContent user={user} />;
}