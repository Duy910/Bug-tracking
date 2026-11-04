import Header from "../Header";
import NewTicketForm from "./NewTicketForm";
import { PLATFORMS, TYPES, PRIORITIES, enabled, teamMembers } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function NewTicket() {
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head"><h1>Báo bug mới</h1></div>
        <NewTicketForm
          platforms={enabled(PLATFORMS)}
          types={enabled(TYPES)}
          priorities={PRIORITIES}
          members={teamMembers()}
        />
      </main>
    </>
  );
}
