import Image from 'next/image';
import odyn from '@/assets/home-odyn.png';

export default function Home() {
    return (
        <>
            <Image data-aos="zoom-in" data-aos-duration="800" src={odyn} alt="Odyn" />
            <div data-aos="zoom-in" data-aos-duration="800" className="flex-1 flex flex-col items-center justify-center gap-5">
                <p className="text-2xl max-w-1/2 text-center">
                    Welcome to Valheim Tools! This is a collection of tools and resources to help you on your journey through Valheim. Feel free to explore the navigation menu to find various utilities and information to enhance your gameplay experience. Enjoy your adventure!
                </p>
                <p className="text-2xl max-w-1/2 text-center">
                    Whether you are a new explorer or a seasoned Viking, our tools are designed to make your time in Valheim more efficient and enjoyable. From sign editors to helpful guides, we aim to support your quest for glory and survival. Check back often as we continue to add new features and updates for the community!
                </p>
            </div>
        </>
    );
}
