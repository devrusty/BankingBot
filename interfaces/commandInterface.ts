export default interface Command {
    Name: string,
    Description?: string,
    Args?: string[],
    Usage: string,
    Invoke: Function,
    Listed: Boolean
}