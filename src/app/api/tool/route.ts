import { GET as rouletteToolHandler } from '../roulette-tool/route';

export async function GET(request: Request) {
  return rouletteToolHandler(request);
}
