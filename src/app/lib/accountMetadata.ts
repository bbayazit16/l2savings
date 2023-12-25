import { createIcon } from "@download/blockies"
import { getAddress } from "ethers"

import provider from "./provider"

export default class AccountMetadata {
    private static blockiesCache: Map<string, string> = new Map()

    public static async getMetadata(
        value: string,
        addressType: "ens" | "address"
    ): Promise<Account> {
        let address: string
        let ens: string | undefined
        let profilePhoto: string
        let displayAddress: string

        if (addressType === "address") {
            // convert to checksummed address
            address = getAddress(value)

            const fetchedEns = await provider.lookupAddress(value)
            ens = fetchedEns || undefined

            profilePhoto = AccountMetadata._createIdenticon(value)
            displayAddress = AccountMetadata._shorten(value)
        } else {
            const [fetchedAddress, avatar] = await Promise.all([
                provider.resolveName(value),
                provider.getAvatar(value)
            ]);
            
            if (!fetchedAddress) {
                throw new Error("ENS name not found")
            }
            profilePhoto = avatar || AccountMetadata._createIdenticon(fetchedAddress)

            // convert to checksummed address
            address = getAddress(fetchedAddress)
            ens = value
            displayAddress = ens
        }

        return { address, ENS: ens, profilePhoto, displayAddress }
    }

    private static _createIdenticon(address: string): string {
        if (!AccountMetadata.blockiesCache.has(address)) {
            AccountMetadata.blockiesCache.set(
                address,
                createIcon({
                    seed: address.toLowerCase(),
                    size: 8,
                    scale: 16,
                }).toDataURL("image/png")
            )
        }
        return AccountMetadata.blockiesCache.get(address)!
    }

    private static _shorten(address: string): string {
        return address.substring(0, 6) + "..." + address.substring(address.length - 4)
    }
}
