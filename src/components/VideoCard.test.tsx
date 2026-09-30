import { fireEvent, render, screen } from '@testing-library/react';

import VideoCard from './VideoCard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/utils', () => ({
  processImageUrl: (url: string) => url,
}));

describe('VideoCard poster recovery', () => {
  it('retries a failed remote poster through the same-origin proxy', () => {
    const poster = 'https://images.example.com/poster one.jpg';
    render(<VideoCard from='douban' poster={poster} title='Test movie' />);

    fireEvent.error(screen.getByAltText('Test movie'));

    const recoveredSrc = screen.getByAltText('Test movie').getAttribute('src');
    expect(decodeURIComponent(recoveredSrc || '')).toContain(
      `/api/image-proxy?url=${encodeURIComponent(poster)}`
    );
  });

  it('shows an unavailable state after both poster attempts fail', () => {
    render(
      <VideoCard
        from='douban'
        poster='https://images.example.com/missing.jpg'
        title='Missing movie'
      />
    );

    fireEvent.error(screen.getByAltText('Missing movie'));
    fireEvent.error(screen.getByAltText('Missing movie'));

    expect(
      screen.getByRole('img', { name: 'Missing movie海报不可用' })
    ).toBeInTheDocument();
    expect(screen.queryByAltText('Missing movie')).not.toBeInTheDocument();
  });

  it('does not render an image with an empty source', () => {
    render(<VideoCard from='douban' title='No poster movie' />);

    expect(
      screen.getByRole('img', { name: 'No poster movie海报不可用' })
    ).toBeInTheDocument();
    expect(screen.queryByAltText('No poster movie')).not.toBeInTheDocument();
  });
});
