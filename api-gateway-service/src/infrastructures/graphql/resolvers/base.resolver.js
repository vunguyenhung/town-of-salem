/*
3rd Party library imports
 */
const { createResolver } = require('apollo-resolvers');
const { createError, isInstance } = require('apollo-errors');
const log = require('debug')('src:base.resolver');

const UnknownError = createError('UnknownError', {
	message: 'An unknown error has occurred! Please try again later',
});

const baseResolver = createResolver(
	// incoming requests will pass through this resolver like a no-op
	null,

	/*
		Only mask outgoing errors that aren't already apollo-errors,
		such as ORM errors etc
	*/
	(root, args, context, error) => {
		log('error:', error);
		return (isInstance(error) ? error : new UnknownError({ message: error.message }));
	}
	,
);

exports.baseResolver = baseResolver;
