"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const categories = ["Voce", "Povrce", "Zitarice", "Stocarstvo", "Mlecni proizvodi", "Ostalo"];

type MarketOption = {
  id: number;
  name: string;
  city: string;
};

type ProductOption = {
  id: number;
  name: string;
  category: string;
};

function normalizeOptionKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("sr-RS");
}

export default function MarketPriceForm() {
  const router = useRouter();
  const [marketName, setMarketName] = useState("");
  const [marketCity, setMarketCity] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState(categories[0]);
  const [selectedMarketId, setSelectedMarketId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("KG");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [markets, setMarkets] = useState<MarketOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);

  const hasExistingMarkets = markets.length > 0;
  const hasExistingProducts = products.length > 0;

  useEffect(() => {
    async function loadOptions() {
      try {
        const response = await fetch("/api/market-prices");
        const data = await response.json().catch(() => []);
        const rows = Array.isArray(data) ? data : [];

        const marketMap = new Map<number, MarketOption>();
        const productMap = new Map<string, ProductOption>();

        rows.forEach((row) => {
          if (row?.market?.id) {
            marketMap.set(row.market.id, {
              id: row.market.id,
              name: row.market.name,
              city: row.market.city,
            });
          }
          if (row?.product?.id) {
            const key = `${normalizeOptionKey(row.product.name || "")}::${normalizeOptionKey(row.product.category || "")}`;
            const existing = productMap.get(key);

            if (!existing || row.product.id < existing.id) {
              productMap.set(key, {
                id: row.product.id,
                name: row.product.name,
                category: row.product.category,
              });
            }
          }
        });

        const marketList = Array.from(marketMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        const productList = Array.from(productMap.values()).sort((a, b) =>
          `${a.name} ${a.category}`.localeCompare(`${b.name} ${b.category}`)
        );

        setMarkets(marketList);
        setProducts(productList);
        if (marketList[0]) setSelectedMarketId(String(marketList[0].id));
        if (productList[0]) {
          setSelectedProductId(String(productList[0].id));
          setProductCategory(productList[0].category || categories[0]);
        }
      } catch {
        // Ignore network errors, manual fallback fields remain available.
      }
    }

    loadOptions();
  }, []);

  useEffect(() => {
    if (!selectedProductId || !hasExistingProducts) return;
    const selected = products.find((item) => item.id === Number(selectedProductId));
    if (selected?.category) {
      setProductCategory(selected.category);
    }
  }, [selectedProductId, hasExistingProducts, products]);

  const selectedMarketLabel = useMemo(() => {
    if (!selectedMarketId) return "";
    const selected = markets.find((item) => item.id === Number(selectedMarketId));
    return selected ? `${selected.name} (${selected.city})` : "";
  }, [markets, selectedMarketId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!price.trim()) {
      setError("Popunite sva obavezna polja.");
      setSuccess("");
      return;
    }

    const useExistingSelection = hasExistingMarkets && hasExistingProducts;
    if (useExistingSelection && (!selectedMarketId || !selectedProductId)) {
      setError("Izaberite postojecu pijacu i proizvod.");
      setSuccess("");
      return;
    }

    if (!useExistingSelection && (!marketName.trim() || !marketCity.trim() || !productName.trim())) {
      setError("Popunite sva obavezna polja.");
      setSuccess("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/market-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: useExistingSelection ? Number(selectedMarketId) : undefined,
          productId: useExistingSelection ? Number(selectedProductId) : undefined,
          marketName: useExistingSelection ? undefined : marketName.trim(),
          marketCity: useExistingSelection ? undefined : marketCity.trim(),
          productName: useExistingSelection ? undefined : productName.trim(),
          productCategory,
          price: Number(price),
          unit,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Cena nije sacuvana.");
        return;
      }

      setSuccess("Cena je uspesno prijavljena.");
      if (!useExistingSelection) {
        setProductName("");
      }
      setPrice("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="market-price-form">
      <div className="market-price-form-hero">
        <div>
          <div className="eyebrow">Prijava cene</div>
          <h3>Dodaj novu cenu u par koraka</h3>
          <p className="muted">
            Ako već postoji pijaca i proizvod, biraš ih iz baze. Ako ne postoji, možeš odmah da dodaš novu stavku.
          </p>
        </div>

        <div className="market-price-form-badges">
          <span className={hasExistingMarkets ? "market-status-chip success" : "market-status-chip"}>
            {hasExistingMarkets ? `${markets.length} pijaca` : "Nova pijaca"}
          </span>
          <span className={hasExistingProducts ? "market-status-chip success" : "market-status-chip"}>
            {hasExistingProducts ? `${products.length} proizvoda` : "Novi proizvod"}
          </span>
        </div>
      </div>

      {selectedMarketLabel ? (
        <p className="market-form-context">Izabrana pijaca: <strong>{selectedMarketLabel}</strong></p>
      ) : null}

      <form className="form market-price-form-body" onSubmit={handleSubmit}>
        {hasExistingMarkets && hasExistingProducts ? (
          <div className="market-form-note">
            Dodavanje cene ide na postojeći proizvod i pijacu iz baze.
          </div>
        ) : (
          <div className="market-form-note market-form-note--warning">
            Nema postojećih proizvoda ili pijaca u bazi. Unesite novu stavku ručno.
          </div>
        )}

        <div className="grid two-cols">
          <label className="field">
            <span>Proizvod</span>
            {hasExistingProducts ? (
              <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.category})
                  </option>
                ))}
              </select>
            ) : (
              <input
                placeholder="Kupina"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
              />
            )}
          </label>

          <label className="field">
            <span>Kategorija</span>
            <select
              value={productCategory}
              onChange={(event) => setProductCategory(event.target.value)}
              disabled={hasExistingProducts}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Pijaca</span>
            {hasExistingMarkets ? (
              <select value={selectedMarketId} onChange={(event) => setSelectedMarketId(event.target.value)}>
                {markets.map((market) => (
                  <option key={market.id} value={market.id}>
                    {market.name} ({market.city})
                  </option>
                ))}
              </select>
            ) : (
              <input
                placeholder="Kalenic"
                value={marketName}
                onChange={(event) => setMarketName(event.target.value)}
              />
            )}
          </label>

          <label className="field">
            <span>Grad</span>
            {hasExistingMarkets ? (
              <input value={selectedMarketLabel} disabled />
            ) : (
              <input
                placeholder="Beograd"
                value={marketCity}
                onChange={(event) => setMarketCity(event.target.value)}
              />
            )}
          </label>

          <label className="field">
            <span>Cena</span>
            <input
              placeholder="380"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Jedinica</span>
            <select value={unit} onChange={(event) => setUnit(event.target.value)}>
              <option value="KG">kg</option>
              <option value="T">t</option>
              <option value="L">l</option>
              <option value="PIECE">komad</option>
            </select>
          </label>
        </div>

        <button className="button market-price-submit" type="submit" disabled={loading}>
          {loading ? "Čuvanje..." : "Sačuvaj cenu"}
        </button>

        {error ? <p className="form-feedback error">{error}</p> : null}
        {success ? <p className="form-feedback success">{success}</p> : null}
      </form>
    </div>
  );
}
