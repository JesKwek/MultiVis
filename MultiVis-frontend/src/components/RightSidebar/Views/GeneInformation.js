import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import styles from './GeneInformation.module.css';

const GeneInformation = (
    {
        name,
        description,
        start,
        end,
        gene_id,
        logic_name,
        source,
        biotype,
        seq_region_name,
        id,
        feature_type,
        strand,
        assembly_name,
        version
    }
) => {
    return (
        <div className={styles.card}>
            <div>
                <p className={styles.title}><span className={styles.name}>{name}</span> <span className={styles.loc}>({start} bp - {end} bp)</span></p>
                <p className={styles.description}>{description}</p>
            </div>
            <div>
                <Accordion sx={{ boxShadow: 'none' }}>
                    <AccordionSummary
                        expandIcon={<ArrowDownwardIcon sx={{ fontSize: '12px' }} />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        sx={{
                            padding: 0,
                            '&.Mui-expanded': {
                                minHeight: 0, // Remove extra height when expanded
                            },
                            '& .MuiAccordionSummary-content': {
                                marginLeft: 0,
                                marginRight: 0,
                                '&.Mui-expanded': {
                                    marginLeft: 0,
                                    marginRight: 0,
                                    marginTop: '15px',
                                    marginBottom: '15px',
                                },
                            },
                        }}
                    >
                        <Typography sx={{ fontSize: '12px', color: 'gray', padding: 0 }}>View Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ padding: 0, marginTop: '-12px' }}>
                        <p className={styles.detail}><span>id:</span> {id}</p>
                        <p className={styles.detail}><span>Gene id:</span> {gene_id}</p>
                        <p className={styles.detail}><span>Logic Name:</span> {logic_name}</p>
                        <p className={styles.detail}><span>Source:</span> {source}</p>
                        <p className={styles.detail}><span>Biotype:</span> {biotype}</p>
                        <p className={styles.detail}><span>Seq region name:</span> {seq_region_name}</p>
                        <p className={styles.detail}><span>Feature type:</span> {feature_type}</p>
                        <p className={styles.detail}><span>Strand:</span> {strand}</p>
                        <p className={styles.detail}><span>Assembly name:</span> {assembly_name}</p>
                        <p className={styles.detail}><span>Version:</span> {version}</p>
                    </AccordionDetails>
                </Accordion>
            </div>
        </div>
    )
};

export default GeneInformation;