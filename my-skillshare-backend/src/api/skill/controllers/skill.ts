/**
 * skill controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::skill.skill', ({ strapi }) => ({
  async create(ctx) {
    const { user } = ctx.state;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a skill');
    }

    // Automatically set the owner to the current user's documentId or ID
    // Strapi 5 uses documentId for relations
    ctx.request.body.data.owner = user.documentId || user.id;

    const response = await super.create(ctx);
    return response;
  },
}));