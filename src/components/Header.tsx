import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-banestes-500 text-white py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        <Link to="/" className="text-2xl font-semibold">
          <span>Banestes</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
