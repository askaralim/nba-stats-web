import { useParams } from 'react-router-dom';

function PlayerDetails() {
  const { playerId } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">球员详情</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-600 text-lg mb-4">
          球员ID详情：{playerId}
        </p>
        <p className="text-gray-500">
          此功能将在未来实现。
        </p>
      </div>
    </div>
  );
}

export default PlayerDetails;

