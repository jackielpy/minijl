import { verifyKey } from 'discord-interactions';
import { InteractionType, InteractionResponseType } from 'discord-interactions';

export default {
    async fetch(request, env) {
        if (request.method === 'POST') {
            const signature = request.headers.get('x-signature-ed25519');
            const timestamp = request.headers.get('x-signature-timestamp');
            const body = await request.clone().arrayBuffer();

            const isValid = verifyKey(
                body,
                signature,
                timestamp,
                env.DISCORD_PUBLIC_KEY,
            );
            if (!isValid) {
                return new Response('Bad request signature', { status: 401 });
            }

            const interaction = JSON.parse(new TextDecoder().decode(body));

            if (interaction.type === InteractionType.PING) {
                return Response.json({ type: InteractionResponseType.PONG });
            }

            if (interaction.type === InteractionType.APPLICATION_COMMAND) {
                const name = interaction.data.name;

                if (name === 'ping') {
                    return Response.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: 'Pong from Cloudflare Worker!' },
                    });
                }

                // TODO: route to email/flight/stock logic here
            }

            return new Response('Unhandled interaction', { status: 400 });
        }

        return new Response('OK');
    },
};
