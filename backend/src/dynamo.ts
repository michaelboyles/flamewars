import type { AttributeValue, DynamoDB, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import { continuationTokenToStr } from "./aws";

export type LimitResult = {
    items: ItemList
    continuationToken?: string
}

export type AttributeMap = Record<string, AttributeValue>;
export type ItemList = AttributeMap[];
export type DynamoKey = AttributeMap;

// Dynamo's Limit behaves unlike a RDS limit for filtered queries. The Limit applies to number of rows
// *searched*, not number of rows returned. This function does multiple queries in a row to achieve a 
// limit on the number of rows returned.
export async function limitQuery(dynamo: DynamoDB, queryInput: QueryCommandInput, limit: number, startKey?: DynamoKey): Promise<LimitResult> {
    const items: ItemList = [];
    let nextKey = startKey;
    do {
        const queryResult = await dynamo.query({
            ...queryInput,
            // Query for 1 more item than we want in our limit so that if the last item of our queries is the
            // last item in the DB, we don't get a continuation token. We remove the extra item after.
            Limit: limit + 1,
            ExclusiveStartKey: nextKey
        });
        nextKey = queryResult.LastEvaluatedKey;
        queryResult.Items?.forEach(attrMap => items.push(attrMap));
    } while (items.length < limit && nextKey);

    // May have overshot and have more items than the limit so correct for that
    if (items.length > limit) {
        const lastItem = items[limit - 1];
        const pk = lastItem.PK.S;
        const sk = lastItem.SK.S;
        if (pk && sk) {
            return {
                items: items.slice(0, limit),
                continuationToken: continuationTokenToStr({
                    PK: {S: pk}, SK: {S: sk}
                })
            };
        }
    }
    return {
        items,
        continuationToken: continuationTokenToStr(nextKey)
    };
}
