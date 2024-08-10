import Feed from "./components/Feed";
import MiniProfile from "./components/MiniProfile";
import Posts from "./components/Posts";

export default function Home() {
  return (
    <main className="grid grid-cols-1 md:grid-cols-3 md:max-w-6xl mx-auto"> 
     {/*Posts (Left) */}
     <section className="md:col-span-2">
      <Posts />
     </section>

     {/*MiniProfile (Right) */}
     <section className="hidden md:inline-grid">
      <div className="fixed w-[300]">
       <MiniProfile />
      </div>
     </section>
    </main>
  );
}
