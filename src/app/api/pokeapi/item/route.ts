export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("id");

  if (!itemId) {
    return Response.json({ error: "Missing item ID" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/item/${itemId}`, {
      cache: "force-cache",
    });

    if (!response.ok) {
      return Response.json(
        { error: `Failed to fetch item: ${response.statusText}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    return Response.json({
      id: data.id,
      name: data.name,
      image: data.sprites?.default || "",
      category: data.category?.name || "misc",
      cost: data.cost || 0,
      description:
        data.flavor_text_entries?.find(
          (entry: { language: { name: string } }) =>
            entry.language.name === "en",
        )?.text || "",
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    return Response.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}
