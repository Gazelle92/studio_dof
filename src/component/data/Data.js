import * as prismic from "@prismicio/client";

const client = prismic.createClient("studiodof");
export async function Data() {
  const docs = await client.getAllByType("studiodofwebsite");
  const infos = await client.getAllByType("info_page");
  const contact = await client.getAllByType("contact");
  const about = await client.getAllByType("about");
 
  return { docs, infos, contact, about };
}
