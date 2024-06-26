import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
async function createBaseEmbed(title, description, color) {
    const embed = new EmbedBuilder().setTitle(`${title}`).setDescription(`📄 ${description}`).setColor(color).setTimestamp();
    return embed;
}
async function createBaseUrlButton(label, url) {
    return new ButtonBuilder().setLabel(`${label}`).setStyle(ButtonStyle.Link).setURL(`${url}`);
}
export async function createItemEmbed(item) {
    console.log("Create embed with - ", JSON.stringify(item));
    const embed = await createBaseEmbed(item.title, item.description, "Grey");
    embed.setURL(item.post_url);
    const photosEmbeds = [];
    const maxPhotos = 3;
    const first_photo_url = item.photo_urls[0];
    embed.setFields([
        { name: "Cena", value: `${item.price}zł`, inline: true },
        { name: "Rozmiar", value: `${item.size}`, inline: true },
        { name: "Stan", value: `${item.status}`, inline: true },
        { name: "Marka", value: `${item.brand_title}`, inline: true }
    ]);
    for (let i = 1; i < item.photo_urls.length && i < maxPhotos; i++) {
        const photo_url = item.photo_urls[i];
        const photoEmbed = new EmbedBuilder().setImage(`${photo_url}`).setURL(`${item.post_url}`);
        photosEmbeds.push(photoEmbed);
    }
    embed.setImage(first_photo_url);
    return { embed, photosEmbeds };
}
export async function createVintedItemActionRow(item) {
    const actionRow = new ActionRowBuilder();
    actionRow.addComponents(await createBaseUrlButton("🔗 Zobacz na Vinted", item.post_url));
    return actionRow;
}
