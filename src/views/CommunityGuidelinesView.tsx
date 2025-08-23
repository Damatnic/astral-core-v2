import { ViewHeader } from '../components/ViewHeader';

export const CommunityGuidelinesView = () => (
    <>
        <ViewHeader 
            title="Community Guidelines"
            subtitle="Our rules for a safe and supportive space."
        />
        <div className="card">
            <h2>Our Principles</h2>
            <ul>
                <li><strong>Be Kind and Courteous:</strong> We're all in this together to create a welcoming environment. Let's treat everyone with respect. Healthy debates are natural, but kindness is required.</li>
                <li><strong>This is Peer Support, Not Therapy:</strong> Offer support as a peer, not as a professional. Avoid giving medical advice or diagnoses. Encourage users to seek professional help when appropriate.</li>
                <li><strong>Respect Everyone's Privacy:</strong> What's shared in the community should stay in the community. Do not ask for or share personal identifying information. Anonymity is key to our platform.</li>
                <li><strong>No Hate Speech or Bullying:</strong> Make sure everyone feels safe. Bullying of any kind isn't allowed, and degrading comments about things like race, religion, culture, sexual orientation, gender or identity will not be tolerated.</li>
                <li><strong>No Promotions or Spam:</strong> Self-promotion, spam and irrelevant links aren't allowed.</li>
            </ul>
        </div>
    </>
);

export default CommunityGuidelinesView;