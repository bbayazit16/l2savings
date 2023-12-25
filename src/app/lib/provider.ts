import { ethers } from "ethers"

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETH_RPC!)
export default provider
