import { covalentNetworks } from "../covalent";
import { DocumentData, OrganizationIndexer, collection, db, doc, getDoc, getDocs } from "../firebase-db";
import * as fs from 'fs';

export const fetchOrgs = async () => {
    try {
        const organizationCollection = 'organizations';
        const accountCollection = 'accounts';
        const querySnapshot = await getDocs(collection(db, organizationCollection));

        const list: OrganizationIndexer = {};

        await Promise.all(querySnapshot.docs.map(async (document: any) => {
            const orgData = document.data();
            await Promise.all(Array.from(orgData.accounts).map(async (item: any) => {
                const docRef = doc(db, accountCollection, item.id);
                const docSnap = await getDoc(docRef) as DocumentData;
                const accountData = docSnap.data();

                if (!list[orgData.name])
                    list[orgData.name] = { wallets: [{ address: accountData.address, network: covalentNetworks[accountData.blockchain] }] }
                else
                    list[orgData.name] = { wallets: [...list[orgData.name].wallets, { address: accountData.address, network: covalentNetworks[accountData.blockchain] }] }
            }));
        }));

        if (!list)
            throw new Error('No organizations found');

        const jsonString = JSON.stringify(list, null, 2);
        const filePath = './orgs.json';
        fs.writeFileSync(filePath, jsonString, 'utf-8');

        return list;
    } catch (error: any) {
        throw new Error(error);
    }
}