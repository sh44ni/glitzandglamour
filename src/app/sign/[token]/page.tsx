import ContractSignForm from './ContractSignForm';

export default async function SignContractPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    return <ContractSignForm token={token} />;
}
