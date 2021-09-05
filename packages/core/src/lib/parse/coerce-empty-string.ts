export function coerceEmptyString<T>(maybeEmpty: string, valueWhenEmpty: T): string | T {
	return maybeEmpty ? maybeEmpty : valueWhenEmpty; 
}
