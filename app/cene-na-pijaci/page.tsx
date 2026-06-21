import Link from "next/link";
import { getMarketPrices } from "@/lib/db";

async function getMarketPricesData() {
  return getMarketPrices();
}

export default async function MarketPricesPage() {
  const marketPrices = await getMarketPrices();

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <div className="eyebrow">Cene na pijaci</div>
          <h1>Dnevni pregled cena</h1>
          <p className="muted">Tabela je povezana sa modelima Market, Product i MarketPrice u bazi.</p>
        </div>
        <Link className="button secondary" href="/">
          Nazad na feed
        </Link>
      </div>

      <section className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Proizvod</th>
              <th>Pijaca</th>
              <th>Cena</th>
              <th>Izvor</th>
            </tr>
          </thead>
          <tbody>
            {marketPrices.map((price) => (
              <tr key={price.id}>
                <td>{price.product?.name}</td>
                <td>
                  {price.market?.name} · {price.market?.city}
                </td>
                <td>
                  {price.price.toString()} {price.unit?.toLowerCase()}
                </td>
                <td>{price.source ?? "User submitted"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Prijavi cenu</h2>
        <form className="form">
          <div className="grid two-cols">
            <label className="field">
              <span>Proizvod</span>
              <input placeholder="Kupina" />
            </label>
            <label className="field">
              <span>Pijaca</span>
              <input placeholder="Valjevo" />
            </label>
            <label className="field">
              <span>Cena</span>
              <input placeholder="380" type="number" />
            </label>
            <label className="field">
              <span>Jedinica</span>
              <select defaultValue="KG">
                <option value="KG">kg</option>
                <option value="T">t</option>
                <option value="L">l</option>
                <option value="PIECE">komad</option>
              </select>
            </label>
          </div>
          <button className="button" type="button">
            Sacuvaj cenu
          </button>
        </form>
      </section>
    </main>
  );
}
