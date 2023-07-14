import { type GetStaticPaths,type GetStaticProps } from 'next';

const about = () => {
    return (
        <div>
            about lucas
        </div>
    );
}

export const getStaticPaths: GetStaticPaths = () => {


    return {
        paths:[],
        fallback:false
    }
}
export const getStaticProps: GetStaticProps = async (ctx) =>{


    return {
        props:{

        }
    }
}

export default about;