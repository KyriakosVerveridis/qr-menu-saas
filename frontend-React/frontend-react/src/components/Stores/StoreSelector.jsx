export default function StoreSelector() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <h2 className="text-xl font-semibold text-slate-700 mb-2">
        Καλωσήρθες!
      </h2>
      <p className="text-slate-500 max-w-md">
        Επίλεξε ένα κατάστημα από το μενού αριστερά για να δεις ή να επεξεργαστείς το menu του,
        ή δημιούργησε ένα νέο κατάστημα πατώντας το κουμπί "+".
      </p>
    </div>
  );
}