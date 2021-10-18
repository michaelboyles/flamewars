import { formatFullTime } from "../util";

test('Format full datetime', () => {
    const formatted = formatFullTime(new Date('2000-01-02T03:04:05'));
    expect(formatted).toEqual('2000-01-02 03:04:05');
});
