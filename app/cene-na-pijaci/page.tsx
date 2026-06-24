import Link from "next/link";
import { getMarketPrices } from "@/lib/db";
import { formatPriceDin, formatPriceSource } from "@/lib/market";
import MarketPriceForm from "../components/MarketPriceForm";

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
                  {formatPriceDin(price.price.toString())} / {price.unit?.toLowerCase()}
                </td>
                <td>{formatPriceSource(price.source)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Prijavi cenu</h2>
        <MarketPriceForm />
      </section>
    </main>
  );
}
