import { useQuery } from 'react-query';
import './App.css';

export interface IProduct {
  id: number;
  title: string;
  price: number;
  image: { url: string };
  desc: string;
  count: number;
  total: number;
  'in-stock': boolean;
}
export interface IProductArr {
  products: IProduct[];
}

const getProducts = async (url: string): Promise<IProductArr['products']> => {
  const result = await fetch(url);
  const data = await result.json();
  return data;
};

const URL: string = 'http://localhost:3000/products';

const App = () => {
  const { isLoading, error, data } = useQuery<IProductArr['products']>('products', () =>
    getProducts(URL)
  );

  console.log(data);

  return <div className='App'>Startup</div>;
};

export default App;
